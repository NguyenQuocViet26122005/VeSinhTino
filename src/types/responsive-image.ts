export interface ResponsiveImage {
  src: string;
  srcSet: string;
}

export type ResponsiveImages = Record<string, ResponsiveImage>;
