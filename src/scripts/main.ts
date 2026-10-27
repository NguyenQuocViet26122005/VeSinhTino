import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let menuMorph: ReturnType<typeof import('morphicons/dom')['createMorph']> | undefined;
let mainMm: gsap.MatchMedia | null = null;
const menuShape = 'M4 7h16M4 17h16';
const closeShape = 'M6 6l12 12M6 18L18 6';

function initMain() {
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

  toggle?.addEventListener('click', () => {
    if (!mobile) return;
    const open = toggle.getAttribute('aria-expanded') === 'true';
    mobile.hidden = open;
    toggle.setAttribute('aria-expanded', String(!open));
    toggle.setAttribute('aria-label', open ? 'Mở menu' : 'Đóng menu');
    updateMenuIcon(!open);
    loadMenuIcon();
  });

  mobile?.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      toggle.focus();
    }
  });

  window.matchMedia('(min-width: 1001px)').addEventListener('change', closeMenu);

  // Filter gallery buttons
  document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const value = btn.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach((b) =>
        b.setAttribute('aria-pressed', String(b === btn))
      );
      document.querySelectorAll<HTMLElement>('[data-category]').forEach((card) => {
        card.hidden = value !== 'all' && card.dataset.category !== value;
      });
      ScrollTrigger.refresh();
    })
  );

  // Photo modal dialog
  const dialog = document.querySelector<HTMLDialogElement>('#photo-dialog');
  const dialogImg = document.querySelector<HTMLImageElement>('#dialog-image');
  const dialogCaption = document.querySelector('#dialog-caption');

  document.querySelectorAll<HTMLButtonElement>('[data-photo]').forEach((btn) =>
    btn.addEventListener('click', () => {
      if (!dialog || !dialogImg) return;
      dialogImg.src = btn.dataset.photo || '';
      dialogImg.alt = btn.dataset.caption || '';
      if (dialogCaption) dialogCaption.textContent = btn.dataset.caption || '';
      dialog.showModal();
    })
  );

  dialog?.querySelector('.dialog-close')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

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

      const heroMedia = document.querySelector<HTMLElement>('.inner-page .service-hero > img, .inner-page .about-teaser > img, .inner-page .article-layout > img, .recruit-panel > img');
      if (heroMedia) {
        heroTl.from(heroMedia, { scale: 0.95, y: 22, opacity: 0, duration: 0.85, ease: 'power2.out', clearProps: 'transform,opacity' }, '-=0.5');

        // Subtle parallax scrub on scroll
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

  window.addEventListener('pagehide', () => mm.revert(), { once: true });
}

// Support initial load and client-side page transitions
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMain);
} else {
  initMain();
}
document.addEventListener('astro:page-load', initMain);
document.addEventListener('astro:before-swap', () => {
  if (mainMm) {
    mainMm.revert();
    mainMm = null;
  }
});
