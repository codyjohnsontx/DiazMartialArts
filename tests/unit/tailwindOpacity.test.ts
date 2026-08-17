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

// Utilities whose value is always a colour, so a `/<alpha>` modifier is always
// an opacity value. Excludes utilities where a slash means a fraction
// (`w-1/2`, `top-1/2`).
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
  'to',
  'via',
];

// `text-` is shared with the font-size utility, whose modifier is a line height
// (`text-sm/6`) rather than an opacity value.
const FONT_SIZES = ['xs', 'sm', 'base', 'lg', 'xl', '[0-9]xl'];

// A named colour (`white`, `slate-500`) or an arbitrary one (`[#101214]`).
const COLOUR = String.raw`(?:\[[^\]]+\]|[A-Za-z0-9-]+)`;
// The same, minus the font-size spellings: the named sizes, and bracketed
// values that are not colour-shaped (`text-[0.8rem]`, `text-[length:var(--x)]`).
const TEXT_COLOUR = String.raw`(?:\[(?:#|rgb|hsl|oklch|oklab|color:)[^\]]*\]|(?!(?:${FONT_SIZES.join('|')})/)[A-Za-z0-9-]+)`;

const MODIFIER = new RegExp(
  String.raw`\b(?:(?:${COLOUR_UTILITIES.join('|')})-${COLOUR}|text-${TEXT_COLOUR})/(\[[^\]]+\]|\d+)`,
  'g',
);

function offScaleModifiers(line: string): string[] {
  return (
    Array.from(line.matchAll(MODIFIER))
      // Arbitrary values (`text-white/[0.72]`) bypass the scale and always generate.
      .filter(([, alpha]) => !alpha.startsWith('[') && !opacityScale.includes(alpha))
      .map(([match]) => match)
  );
}

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

  it('flags off-scale alphas without misreading other slash utilities', () => {
    const inert = [
      'text-white/72',
      'text-black/72',
      'border-white/18',
      'border-black/8',
      'bg-[#101214]/73',
      'text-[#fff]/73',
    ];
    const valid = [
      'text-white/70',
      'border-black/10',
      'bg-[#101214]/70',
      'text-white/[0.72]',
      'text-sm/6',
      'text-base/7',
      'text-2xl/9',
      'text-[0.8rem]/6',
      'w-1/2',
      'top-1/2',
    ];

    expect(inert.filter((cls) => offScaleModifiers(cls).length === 0)).toEqual([]);
    expect(valid.filter((cls) => offScaleModifiers(cls).length > 0)).toEqual([]);
  });

  it('only uses opacity values that generate a CSS rule', () => {
    const offScale = SOURCE_ROOTS.flatMap((root) =>
      sourceFiles(root).flatMap((file) =>
        readFileSync(file, 'utf8')
          .split('\n')
          .flatMap((line, index) =>
            offScaleModifiers(line).map((match) => `${file}:${index + 1} ${match}`),
          ),
      ),
    );

    expect(offScale).toEqual([]);
  });
});
