import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// Fontsource's latin-ext ranges overlap Vietnamese letters such as đ/ă.
// Prefer the Vietnamese subset when both contain the same character, retaining
// latin-ext for other languages instead of downloading it just for Vietnamese.
const vietnameseFontPriority = {
  postcssPlugin: 'tino-vietnamese-font-priority',
  OnceExit(root) {
    const preferred = [];
    root.walkAtRules('font-face', rule => {
      if (rule.nodes.some(node => node.prop === 'src' && node.value.includes('-vietnamese-'))) preferred.push(rule);
    });
    for (const rule of preferred) { rule.remove(); root.append(rule); }
  }
};

export default defineConfig({
  integrations: [react()],
  output: 'static',
  trailingSlash: 'always',
  vite: { css: { postcss: { plugins: [vietnameseFontPriority] } } },
  // Deliver styles with the static HTML instead of delaying first paint on two CSS requests.
  build: { inlineStylesheets: 'always' }
});
