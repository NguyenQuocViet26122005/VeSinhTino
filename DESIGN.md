---
version: alpha
name: Tino — A Clean Opening
description: Site-wide blue design system with distinct service, editorial, pricing and contact layouts.
colors:
  primary: "#082c4a"
  ink: "#10354e"
  accent: "#a9e7f5"
  paper: "#f5f9fc"
  muted: "#506d82"
  surface: "#e6f1f8"
typography:
  display:
    fontFamily: Manrope
    fontSize: 216px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: -0.075em
  heading:
    fontFamily: Be Vietnam Pro
    fontSize: 48px
    fontWeight: 500
    lineHeight: 1.24
    letterSpacing: -0.045em
  body:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.75
  action:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.4
rounded:
  small: 7px
  glass-action: 12px
  pill: 999px
spacing:
  small: 8px
  medium: 20px
  large: 40px
  desktop-section: 110px
  mobile-section: 65px
components:
  page:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
  hero:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.paper}"
  caption:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.muted}"
  service-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.primary}"
    typography: "{typography.action}"
    rounded: "{rounded.pill}"
    height: 60px
  button-inverted:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.accent}"
    rounded: "{rounded.pill}"
  glass-service-link:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.paper}"
    rounded: "{rounded.glass-action}"
---

## Overview

Tino is a home and industrial cleaning service in Ho Chi Minh City. The experience should feel capable, clear and welcoming. The signature is a squeegee revealing a real apartment photograph behind frosted glass. This is a visual simulation, not a before-and-after claim.

This system applies to every route. Shared blue tokens live in src/styles/global.css; interior layouts live in src/styles/interior.css. Homepage overrides live in src/styles/wow.css; behavior lives in src/scripts/wow.ts. Service pages use a photograph-led hero and dark service navigator; articles use a table of contents; pricing uses anchor navigation; contact and recruitment have dedicated panels.

## Colors

Use navy blue for the opening, navigation and glass section; ice blue for important actions and selected services; cool white for reading. Reserve muted blue for text on light surfaces. Do not put ice blue text on ivory. Glass-link token colors describe the underlying navy surface; translucent highlights are decorative overlays, not text surfaces.

## Typography

Load the existing local Be Vietnam Pro and Manrope fonts. Preserve Vietnamese diacritics. Reserve explicit spacing between hero lines for the below-base dot and above-base accents; never tighten lines until marks collide. Hero display size is fluid in implementation: clamp(140px,17vw,260px) on desktop and clamp(112px,29vw,170px) on mobile. Token dimensions are reference sizes, not a requirement to remove responsive rules. Keep semantic headings as HTML, with one h1 per page. Do not rasterize service names, prices or contact details.

## Layout

Homepage desktop container is at most 1320px with 56px gutters. At mobile widths use 20px gutters. The hero uses asymmetric copy and a tilted photo pane. Follow with a quiet introduction, interactive service showroom, staggered real work photographs, price table, process, FAQ and a ice blue closing invitation.

On mobile stack the pane below the copy, keep the quote action visible early, use native range input, and bring the selected service preview into view. No scroll locking. Retain all 21 source routes and the additional price and 404 pages.

## Elevation & Depth

Use independent physical layers only in the glass scene: photograph, haze, reflection, frame and squeegee. Pointer tilt is desktop/fine-pointer only. The wipe follows natural scroll until the user interacts. Direct horizontal dragging on the glass, keyboard arrows/Home/End and the native range all share one progress value. Pointer capture handles leaving the pane; pan-y preserves vertical touch scrolling. A reset clears the glass and completion announces once through a polite live region. No additional runtime. The redundant standalone 3D demonstration is removed from the homepage; retain the photo-based glass interaction only. Respect prefers-reduced-motion and hidden-tab lifecycle. Keep informational sections calm.

## Shapes

Use minimal rounding for photographs; use the large asymmetric upper-left curve only for the hero glass. Quote actions use a capsule with a circular arrow endcap. The glass-service action uses a 12px radius and a 36px inset arrow chip.

## Components

Quote action: adapt ThreeUI Community Understory Arrow Pill to Tino ice blue/navy colors, Vietnamese copy and a real /lien-he/ anchor. Glass service link: adapt Aster Glass Arrow to the existing dark service section. Scoped CSS only; no additional canvas, iframe or full ThreeUI runtime for these controls. Keep focus rings, minimum 44px touch targets, press feedback and hover gated to capable pointers. Reduced motion disables translations.

Service selection uses buttons with aria-pressed and adjacent detail-page links. Gallery uses a native dialog. Price values and units come from src/data/site.ts and are verified against original survey data. Retain Hairline Query in FAQ.

## Do's and Don'ts

- Do read this document before visual changes and run npm run design:lint after changing it.
- Do use actual Tino images with existing attribution/watermarks. Preserve public contact details and verified prices.
- Do inspect desktop plus 390px and 320px browser layouts after visual edits.
- Do keep real HTML links usable without animation.
- Do keep third-party license notices in THIRD_PARTY_NOTICES.md.
- Do not invent testimonials, project counts or before-and-after evidence.
- Do not add unrelated particles, space scenes, looping shaders or duplicate animation runtimes.
- Do not claim this documentation or the Google CLI is a globally installed Codex skill.

Source specification: https://github.com/google-labs-code/design.md/blob/main/docs/spec.md
