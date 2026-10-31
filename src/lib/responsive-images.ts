import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import type { ResponsiveImages } from '../types/responsive-image';

// Build-time only. Originals remain available for the full-size photo dialog.
const imageModules = import.meta.glob<{ default: ImageMetadata }>([
  '../../public/images/**/*.webp',
  '!../../public/images/3b21a7ec444d0b39.webp',
  '!../../public/images/09ac88fe21b3b5da.webp'
]);

export async function responsiveImages(paths: string[]): Promise<ResponsiveImages> {
  return Object.fromEntries(await Promise.all([...new Set(paths)].map(async path => {
    const load = imageModules[`../../public${path}`];
    if (!load) throw new Error(`Missing local image: ${path}`);
    const { default: src } = await load();
    const widths = [...new Set([320, 480, 560, 640, 720, 960, Math.min(src.width, 1280)].filter(width => width <= src.width))];
    const image = await getImage({ src, width: Math.min(src.width, 640), widths, format: 'webp', quality: 80 });
    return [path, { src: image.src, srcSet: image.srcSet.attribute }];
  })));
}

// Interior pages: same build-time renditions, but a photo outside the glob (hero/logo
// handled elsewhere) falls back to its original file instead of failing the build.
export async function responsiveImagesOrOriginal(paths: string[]): Promise<ResponsiveImages> {
  const known = [...new Set(paths)].filter(path => imageModules[`../../public${path}`]);
  const built = await responsiveImages(known);
  return Object.fromEntries([...new Set(paths)].map(path => [path, built[path] ?? { src: path, srcSet: '' }]));
}
