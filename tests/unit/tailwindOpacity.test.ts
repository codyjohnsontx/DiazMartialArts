import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import resolveConfig from 'tailwindcss/resolveConfig';
import { describe, expect, it } from 'vitest';

import tailwindConfig from '@/tailwind.config';

/**
 * Tailwind resolves a colour opacity modifier (`text-white/70`) against
 * `theme.opacity`, whose default scale is 0, 5, 10, ... 95, 100. An off-scale
 * value such as `text-white/72` matches no key, so Tailwind emits no rule at
 * all and the element silently inherits its colour instead of rendering muted.
 * The build stays green, so only a check like this one catches it.
 */
const opacityScale = Object.keys(resolveConfig(tailwindConfig).theme?.opacity ?? {});

// Utilities that take a colour, and therefore a `/<alpha>` modifier. Excludes
// utilities where a slash means a fraction (`w-1/2`, `top-1/2`).
const COLOUR_UTILITIES = [
  'accent',
  'bg',
  'border',
  'caret',
  'decoration',
  'divide',
  'fill',
  'from',
  'outline',
  'placeholder',
  'ring',
  'shadow',
  'stroke',
  'text',
  'to',
  'via',
];

const MODIFIER = new RegExp(
  String.raw`\b(?:${COLOUR_UTILITIES.join('|')})-[A-Za-z0-9-]+/(\[[^\]]+\]|\d+)`,
  'g',
);

// Mirrors the `content` globs in tailwind.config.ts.
const SOURCE_ROOTS = ['app', 'components'];
const SOURCE_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.mdx', '.css'];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return SOURCE_EXTENSIONS.includes(path.extname(entry.name)) ? [full] : [];
  });
}

describe('tailwind colour opacity modifiers', () => {
  it('exposes an opacity scale to validate against', () => {
    expect(opacityScale).toContain('70');
    expect(opacityScale).not.toContain('72');
  });

  it('only uses opacity values that generate a CSS rule', () => {
    const offScale = SOURCE_ROOTS.flatMap((root) =>
      sourceFiles(root).flatMap((file) =>
        readFileSync(file, 'utf8')
          .split('\n')
          .flatMap((line, index) =>
            Array.from(line.matchAll(MODIFIER))
              // Arbitrary values (`text-white/[0.72]`) bypass the scale and always generate.
              .filter(([, alpha]) => !alpha.startsWith('[') && !opacityScale.includes(alpha))
              .map(([match]) => `${file}:${index + 1} ${match}`),
          ),
      ),
    );

    expect(offScale).toEqual([]);
  });
});
