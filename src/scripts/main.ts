import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createMagnet, resolveMagnetSettings, FLOATING_MAGNET_OPTIONS } from '../lib/magnet';

gsap.registerPlugin(ScrollTrigger);

let menuMorph: ReturnType<typeof import('morphicons/dom')['createMorph']> | undefined;
let mainMm: gsap.MatchMedia | null = null;
let contactMagnets: ReturnType<typeof createMagnet>[] = [];
const clearContactMagnets = () => {
  contactMagnets.forEach(controller => controller.destroy());
  contactMagnets = [];
};
const menuShape = 'M4 7h16M4 17h16';
const closeShape = 'M6 6l12 12M6 18L18 6';

let globalListenersAttached = false;
function ensureGlobalListeners() {
  if (globalListenersAttached) return;
  globalListenersAttached = true;

  // Preserve an early submit until the visible React form has committed.
  document.addEventListener('submit', event => {
    const form = event.target;
    if (form instanceof HTMLFormElement && form.matches('.contact-form') && !form.dataset.contactReady) {
      event.preventDefault();
      event.stopImmediatePropagation();
      form.dataset.pendingSubmit = 'true';
    }
  }, true);

  document.addEventListener('click', (e) => {
    const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
    const mobile = document.querySelector<HTMLElement>('#mobile-nav');
    if (toggle?.getAttribute('aria-expanded') === 'true') {
      const target = e.target as Node;
      if (!toggle.contains(target) && !mobile?.contains(target)) {
        if (mobile) mobile.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Mở menu');
        const menuPath = document.querySelector<SVGPathElement>('#menu-morph');
        if (menuMorph) menuMorph.morphTo(menuShape);
        else menuPath?.setAttribute('d', menuShape);
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
      const mobile = document.querySelector<HTMLElement>('#mobile-nav');
      if (toggle?.getAttribute('aria-expanded') === 'true') {
        if (mobile) mobile.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Mở menu');
        const menuPath = document.querySelector<SVGPathElement>('#menu-morph');
        if (menuMorph) menuMorph.morphTo(menuShape);
        else menuPath?.setAttribute('d', menuShape);
        toggle.focus();
      }
    }
  });

  window.matchMedia('(min-width: 1001px)').addEventListener('change', (e) => {
    if (e.matches) {
      const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
      const mobile = document.querySelector<HTMLElement>('#mobile-nav');
      if (mobile) mobile.hidden = true;
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Mở menu');
      }
      const menuPath = document.querySelector<SVGPathElement>('#menu-morph');
      if (menuMorph) menuMorph.morphTo(menuShape);
      else menuPath?.setAttribute('d', menuShape);
    }
  });
}

function initMain() {
  clearContactMagnets();
  document.querySelectorAll<HTMLElement>('[data-contact-magnet]').forEach(wrapper => {
    const inner = wrapper.firstElementChild;
    if (inner instanceof HTMLElement) contactMagnets.push(createMagnet(wrapper, inner, { current: resolveMagnetSettings(FLOATING_MAGNET_OPTIONS) }));
  });
  menuMorph?.destroy();
  menuMorph = undefined;
  if (mainMm) {
    mainMm.revert();
    mainMm = null;
  }
  const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
  const mobile = document.querySelector<HTMLElement>('#mobile-nav');
  const menuPath = document.querySelector<SVGPathElement>('#menu-morph');

  const updateMenuIcon = (open: boolean) => {
    if (menuMorph) menuMorph.morphTo(open ? closeShape : menuShape);
    else menuPath?.setAttribute('d', open ? closeShape : menuShape);
  };

  let iconLoading = false;
  const loadMenuIcon = () => {
    if (iconLoading || !menuPath) return;
    iconLoading = true;
    import('morphicons/dom')
      .then(({ createMorph }) => {
        if (!menuPath.isConnected) return;
        menuMorph?.destroy();
        menuMorph = createMorph(
          menuPath,
          toggle?.getAttribute('aria-expanded') === 'true' ? closeShape : menuShape,
          { reducedMotion: 'user' }
        );
      })
      .catch(() => {
        iconLoading = false;
      });
  };

  const closeMenu = () => {
    if (mobile && toggle) {
      mobile.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Mở menu');
      updateMenuIcon(false);
    }
  };

  if (toggle) {
    toggle.onclick = (e) => {
      e.stopPropagation();
      if (!mobile) return;
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      const nextOpen = !isOpen;
      mobile.hidden = !nextOpen;
      toggle.setAttribute('aria-expanded', String(nextOpen));
      toggle.setAttribute('aria-label', nextOpen ? 'Đóng menu' : 'Mở menu');
      if (nextOpen && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        mobile.animate([{opacity:.6,transform:'translateY(-6px)'},{opacity:1,transform:'translateY(0)'}],{duration:180,easing:'cubic-bezier(.22,1,.36,1)'});
      }
      updateMenuIcon(nextOpen);
      loadMenuIcon();
    };
  }

  mobile?.querySelectorAll('a').forEach((a) => {
    a.onclick = closeMenu;
  });

  // Filter gallery buttons
  document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((btn) => {
    btn.onclick = () => {
      const value = btn.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach((b) =>
        b.setAttribute('aria-pressed', String(b === btn))
      );
      document.querySelectorAll<HTMLElement>('[data-category]').forEach((card) => {
        card.hidden = value !== 'all' && card.dataset.category !== value;
      });
      ScrollTrigger.refresh();
    };
  });

  // Photo modal dialog
  const dialog = document.querySelector<HTMLDialogElement>('#photo-dialog');
  const dialogImg = document.querySelector<HTMLImageElement>('#dialog-image');
  const dialogCaption = document.querySelector('#dialog-caption');

  document.querySelectorAll<HTMLButtonElement>('[data-photo]').forEach((btn) => {
    btn.onclick = () => {
      if (!dialog || !dialogImg) return;
      dialogImg.src = btn.dataset.photo || '';
      dialogImg.alt = btn.dataset.caption || '';
      if (dialogCaption) dialogCaption.textContent = btn.dataset.caption || '';
      dialog.showModal();
    };
  });

  const dialogClose = dialog?.querySelector<HTMLButtonElement>('.dialog-close');
  if (dialogClose) {
    dialogClose.onclick = () => dialog?.close();
  }
  if (dialog) {
    dialog.onclick = (e) => {
      if (e.target === dialog) dialog.close();
    };
  }

  const mm = gsap.matchMedia();
  mainMm = mm;
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // Reveal any explicitly marked items
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      gsap.from(el, {
        y: 24,
        duration: 0.75,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 94%', once: true },
        clearProps: 'transform'
      });
    });

    const photo = document.querySelector('.hero-main-photo');
    if (photo) {
      gsap.to(photo, {
        yPercent: 5,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
      });
    }

    // --- Inner Pages Rich Motion System ---
    const isInner = document.body.classList.contains('inner-page');
    if (isInner) {
      // 1. Entrance timeline for page hero / intro
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      const breadcrumbs = document.querySelector('.inner-page .breadcrumbs, .inner-page .page-kicker');
      if (breadcrumbs) {
        heroTl.from(breadcrumbs, { y: 12, opacity: 0, duration: 0.5, clearProps: 'transform,opacity' });
      }

      const h1 = document.querySelector('.inner-page .service-hero h1, .inner-page .page-intro h1, .inner-page .not-found-code');
      if (h1) {
        heroTl.from(h1, { y: 28, opacity: 0, duration: 0.75, clearProps: 'transform,opacity' }, '-=0.35');
      }

      const heroText = document.querySelectorAll('.inner-page .service-hero p, .inner-page .page-intro > p, .inner-page .service-hero .tag');
      if (heroText.length) {
        heroTl.from(heroText, { y: 16, opacity: 0, duration: 0.6, stagger: 0.08, clearProps: 'transform,opacity' }, '-=0.45');
      }

      const heroMedia = document.querySelector<HTMLElement>('.inner-page .service-hero > img, .inner-page .about-teaser > img');
      if (heroMedia) {
        heroTl.from(heroMedia, { scale: 0.95, y: 22, opacity: 0, duration: 0.85, ease: 'power2.out', clearProps: 'transform,opacity' }, '-=0.5');
      }

      const articleImg = document.querySelector<HTMLElement>('.inner-page .article-layout > img');
      if (articleImg) {
        gsap.from(articleImg, { opacity: 0, duration: 0.6, ease: 'power2.out', clearProps: 'opacity' });
      }

      // 2. Section Headings Scroll Reveals
      document.querySelectorAll<HTMLElement>('.inner-page h2').forEach((h2) => {
        gsap.from(h2, {
          y: 22,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: h2, start: 'top 92%', once: true },
          clearProps: 'transform,opacity'
        });
      });

      // 3. Task List Items Stagger (Scope of work)
      const taskList = document.querySelector('.inner-page .task-list');
      if (taskList) {
        gsap.from(taskList.querySelectorAll('li'), {
          x: -16,
          opacity: 0,
          duration: 0.5,
          stagger: 0.07,
          ease: 'power2.out',
          scrollTrigger: { trigger: taskList, start: 'top 88%', once: true },
          clearProps: 'transform,opacity'
        });
      }

      // 4. Service Gallery Thumbnails Stagger
      document.querySelectorAll('.inner-page .service-gallery').forEach((gal) => {
        gsap.from(gal.querySelectorAll('button'), {
          scale: 0.92,
          y: 16,
          opacity: 0,
          duration: 0.55,
          stagger: 0.07,
          ease: 'power2.out',
          scrollTrigger: { trigger: gal, start: 'top 88%', once: true },
          clearProps: 'transform,opacity'
        });
      });

      // 5. Authentic Project Showcase Grid (About page)
      const showcase = document.querySelector('.project-showcase-grid');
      if (showcase) {
        gsap.from(showcase.querySelectorAll('.project-photo-card'), {
          scale: 0.94,
          y: 18,
          opacity: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: { trigger: showcase, start: 'top 88%', once: true },
          clearProps: 'transform,opacity'
        });
      }

      // 6. Service Cards Grid Stagger (Category & Related services)
      document.querySelectorAll('.inner-page .service-list').forEach((list) => {
        gsap.from(list.querySelectorAll('.service-card'), {
          y: 28,
          opacity: 0,
          duration: 0.65,
          stagger: 0.09,
          ease: 'power2.out',
          scrollTrigger: { trigger: list, start: 'top 88%', once: true },
          clearProps: 'transform,opacity'
        });
      });

      // 7. Journal Cards Stagger (News / Handbook)
      const journalGrid = document.querySelector('.inner-page .journal-grid');
      if (journalGrid) {
        gsap.from(journalGrid.querySelectorAll('.journal-card'), {
          y: 24,
          opacity: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: { trigger: journalGrid, start: 'top 88%', once: true },
          clearProps: 'transform,opacity'
        });
      }

      // 8. Price Blocks Stagger
      document.querySelectorAll<HTMLElement>('.inner-page .price-block').forEach((block) => {
        gsap.from(block, {
          y: 22,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: block, start: 'top 90%', once: true },
          clearProps: 'transform,opacity'
        });
      });

      const priceJump = document.querySelector('.price-jump');
      if (priceJump) {
        gsap.from(priceJump.querySelectorAll('a'), {
          y: 12,
          opacity: 0,
          duration: 0.45,
          stagger: 0.05,
          ease: 'power2.out',
          scrollTrigger: { trigger: priceJump, start: 'top 92%', once: true },
          clearProps: 'transform,opacity'
        });
      }

      // 9. Process List Steps Stagger
      const processList = document.querySelector('.inner-page .process-list');
      if (processList) {
        gsap.from(processList.querySelectorAll('li'), {
          x: -18,
          opacity: 0,
          duration: 0.55,
          stagger: 0.09,
          ease: 'power2.out',
          scrollTrigger: { trigger: processList, start: 'top 88%', once: true },
          clearProps: 'transform,opacity'
        });
      }

      // 10. Contact Page Blocks
      const contactCard = document.querySelector('.inner-page .contact-card');
      if (contactCard) {
        gsap.from(contactCard, {
          y: 26,
          opacity: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: { trigger: contactCard, start: 'top 90%', once: true },
          clearProps: 'transform,opacity'
        });
      }

      const branchList = document.querySelector('.inner-page .branch-list');
      if (branchList) {
        gsap.from(branchList.querySelectorAll('article'), {
          y: 18,
          opacity: 0,
          duration: 0.55,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: { trigger: branchList, start: 'top 90%', once: true },
          clearProps: 'transform,opacity'
        });
      }

      // 11. Contact Band (CTA band at bottom of pages)
      const band = document.querySelector('.inner-page .contact-band');
      if (band) {
        gsap.from(band, {
          y: 22,
          opacity: 0,
          duration: 0.65,
          ease: 'power2.out',
          scrollTrigger: { trigger: band, start: 'top 92%', once: true },
          clearProps: 'transform,opacity'
        });
      }
    }

    document.fonts.ready.then(() => ScrollTrigger.refresh());
  });

  mm.add('(prefers-reduced-motion: no-preference) and (min-width: 701px)', () => {
    const heroMedia = document.querySelector<HTMLElement>('.inner-page .service-hero > img, .inner-page .about-teaser > img');
    if (!heroMedia) return;

    gsap.to(heroMedia, {
      yPercent: 4,
      ease: 'none',
      scrollTrigger: {
        trigger: heroMedia,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.8
      }
    });
  });

  window.addEventListener('pagehide', () => mm.revert(), { once: true });
}

let hasPageLoaded = false;
document.addEventListener('astro:page-load', () => {
  hasPageLoaded = true;
  ensureGlobalListeners();
  initMain();
});

if (!hasPageLoaded && document.readyState === 'complete') {
  ensureGlobalListeners();
  initMain();
}
document.addEventListener('astro:before-swap', () => {
  clearContactMagnets();
  if (mainMm) {
    mainMm.revert();
    mainMm = null;
  }
});
